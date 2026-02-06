import { User, Sparkles } from 'lucide-react';
import { Streamdown } from 'streamdown';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
  images?: string[];
}

export function ChatMessage({
  role,
  content,
  timestamp,
  isStreaming,
  images,
}: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-4 py-6 px-4 transition-elegant',
        isUser ? 'bg-transparent' : 'bg-muted/30'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-elegant',
          isUser
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-primary text-primary-foreground'
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          {isStreaming && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <span className="animate-pulse">●</span>
              Thinking...
            </span>
          )}
        </div>

        {/* Message Content */}
        <div className="prose prose-sm max-w-none dark:prose-invert">
          {isUser ? (
            <p className="text-foreground whitespace-pre-wrap">{content}</p>
          ) : (
            <Streamdown>{content}</Streamdown>
          )}
        </div>

        {/* Images */}
        {images && images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {images.map((image, idx) => (
              <img
                key={idx}
                src={`data:image/jpeg;base64,${image}`}
                alt={`Message image ${idx + 1}`}
                className="rounded-lg shadow-elegant w-full h-auto max-w-xs"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
