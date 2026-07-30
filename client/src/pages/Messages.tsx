import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function Messages() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageText, setMessageText] = useState("");

  const { data: conversations } = trpc.messages.getConversations.useQuery();
  const { data: currentMessages } = trpc.messages.getConversation.useQuery(selectedConversation || 0, {
    enabled: !!selectedConversation,
  });

  const sendMutation = trpc.messages.send.useMutation();

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) {
      toast.error("Veuillez sélectionner une conversation et écrire un message");
      return;
    }

    try {
      await sendMutation.mutateAsync({
        recipientId: selectedConversation,
        content: messageText,
      });
      setMessageText("");
      // Refresh messages
      window.location.reload();
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">Messagerie</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <Card className="p-4 space-y-2 max-h-96 overflow-y-auto">
              {conversations && conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedConversation(conv.userId)}
                    className={`w-full text-left p-3 rounded-lg transition ${
                      selectedConversation === conv.userId
                        ? "bg-green-100 border border-green-300"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <p className="font-semibold text-gray-900">Utilisateur #{conv.userId}</p>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(conv.lastMessageDate).toLocaleDateString()}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-block bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-2">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600">Aucune conversation</p>
                </div>
              )}
            </Card>
          </div>

          {/* Messages View */}
          <div className="md:col-span-2">
            {selectedConversation ? (
              <Card className="p-6 flex flex-col h-96">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {currentMessages && currentMessages.length > 0 ? (
                    currentMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderId === user?.id
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500">Aucun message</div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Écrivez votre message..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">Sélectionnez une conversation pour commencer</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
