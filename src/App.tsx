import { Toaster } from 'sonner';
import { useState } from 'react';
import Chat from './pages/Chat';
import Pricing from './pages/Pricing';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'chat' | 'pricing'>('chat');

  return (
    <>
      {currentPage === 'chat' ? (
        <Chat />
      ) : (
        <Pricing />
      )}
      <Toaster />
    </>
  );
}
