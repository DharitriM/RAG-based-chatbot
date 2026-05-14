import FileUploadComponent from './components/file-upload';
import ChatComponent from './components/chat';
import { UserButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white">
      {/* Navigation Bar */}
      <nav className="h-16 border-b px-6 flex items-center justify-between bg-gray-50 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-800">PDF RAG Chatbot</h1>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="w-[30vw] h-full p-4 flex justify-center items-center overflow-y-auto bg-gray-50/50">
          <FileUploadComponent />
        </div>
        <div className="w-[70vw] h-full border-l-2 bg-white">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}
