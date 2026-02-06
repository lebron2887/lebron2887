import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { ImageUploader } from '@/components/ImageUploader';
import { UploadedImages } from '@/components/UploadedImages';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { PanelLeftClose, PanelLeft } from 'lucide-react';
import { toast } from 'sonner';
import { streamChat, transcribeAudio } from '@/lib/openai';
import {
  getUserData,
  saveUserData,
  saveConversation,
  getConversations,
  incrementImageUsage,
  Conversation,
  Message,
} from '@/lib/storage';
import { generateId } from '@/lib/utils';

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userData, setUserData] = useState(getUserData());
  const [conversations, setConversations] = useState(getConversations());
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const currentConversation = conversations.find(c => c.id === currentConversationId);
  const messages = currentConversation?.messages || [];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [streamingContent, currentConversationId]);

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: generateId(),
      title: `Chat ${new Date().toLocaleString()}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setConversations([newConversation, ...conversations]);
    setCurrentConversationId(newConversation.id);
    setUploadedImages([]);
  };

  const handleSendMessage = async (message: string) => {
    if (!currentConversationId) {
      handleNewChat();
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: message,
      timestamp: Date.now(),
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
    };

    const updated = {
      ...currentConversation!,
      messages: [...messages, userMessage],
      updatedAt: Date.now(),
    };

    // Increment image usage
    if (uploadedImages.length > 0) {
      const newUserData = { ...userData, imagesUsed: userData.imagesUsed + uploadedImages.length };
      setUserData(newUserData);
      saveUserData(newUserData);
    }

    saveConversation(updated);
    setConversations(getConversations());
    setUploadedImages([]);

    // Stream AI response
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      let fullResponse = '';

      for await (const chunk of streamChat(
        [
          { role: 'system', content: 'You are a highly intelligent AI assistant.' },
          ...conversationHistory,
          { role: 'user', content: message },
        ],
        userData.tier,
        uploadedImages
      )) {
        fullResponse += chunk;
        setStreamingContent(fullResponse);
      }

      const assistantMessage: Message = {
        id: generateId(),
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };

      updated.messages.push(assistantMessage);
      updated.updatedAt = Date.now();
      saveConversation(updated);
      setConversations(getConversations());
    } catch (error) {
      toast.error('Failed to send message');
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  const handleVoiceInput = async (audioBlob: Blob) => {
    try {
      const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
      const text = await transcribeAudio(file);
      await handleSendMessage(text);
    } catch (error) {
      toast.error('Failed to process voice input');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b bg-card p-4">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {userData.tier === 'free' ? '🆓 Free' : userData.tier === 'pro' ? '⚡ Pro' : '✨ Max'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="w-64 border-r bg-card flex flex-col">
            <div className="p-4 border-b">
              <Button onClick={handleNewChat} className="w-full">
                + New Chat
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversationId(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-elegant ${
                    currentConversationId === conv.id
                      ? 'bg-accent border border-primary/20'
                      : 'hover:bg-accent'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{conv.title}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute left-2 top-20 z-40"
          >
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </Button>

          <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
            {!currentConversationId ? (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
                  <p className="text-muted-foreground mb-6">Start a new chat to begin</p>
                  <Button onClick={handleNewChat}>Start New Chat</Button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    role={msg.role}
                    content={msg.content}
                    timestamp={new Date(msg.timestamp)}
                    images={msg.images}
                  />
                ))}
                {isStreaming && (
                  <ChatMessage
                    role="assistant"
                    content={streamingContent || 'Thinking...'}
                    isStreaming={true}
                  />
                )}
              </div>
            )}
          </div>

          {currentConversationId && (
            <div className="border-t bg-background p-4 space-y-4">
              <Card>
                <ImageUploader
                  onImagesSelected={setUploadedImages}
                  currentTier={userData.tier}
                  imagesUsed={userData.imagesUsed}
                />
              </Card>

              {uploadedImages.length > 0 && (
                <Card>
                  <UploadedImages
                    images={uploadedImages}
                    onRemove={(idx) =>
                      setUploadedImages((prev) => prev.filter((_, i) => i !== idx))
                    }
                  />
                </Card>
              )}

              <ChatInput
                onSend={handleSendMessage}
                onVoiceInput={handleVoiceInput}
                disabled={isStreaming}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
