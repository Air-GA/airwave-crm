
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AtSign, 
  Clock, 
  MessageCircle, 
  PhoneCall, 
  Plus, 
  Search, 
  Send, 
  Share2,
  UserPlus, 
  Users,
  Video 
} from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Messages = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [activeConversation, setActiveConversation] = useState<string | null>("c1");
  const [isDiscordDialogOpen, setIsDiscordDialogOpen] = useState(false);
  const [discordInviteLink, setDiscordInviteLink] = useState("");
  const [discordServerName, setDiscordServerName] = useState("");
  
  // Mock data for conversations
  const conversations = [
    {
      id: "c1",
      name: "John Smith",
      avatar: null,
      lastMessage: "Thanks for the quick service! The AC is working great now.",
      timestamp: "2023-08-28T14:30:00",
      unread: 0,
      messages: [
        {
          id: "m1",
          sender: "customer",
          content: "Hello, my AC isn't cooling properly. Can someone come take a look?",
          timestamp: "2023-08-27T10:15:00"
        },
        {
          id: "m2",
          sender: "staff",
          content: "Hi John, I'd be happy to help. We can send a technician tomorrow between 9am and 12pm. Would that work for you?",
          timestamp: "2023-08-27T10:20:00"
        },
        {
          id: "m3",
          sender: "customer",
          content: "Yes, that works great. Thank you!",
          timestamp: "2023-08-27T10:22:00"
        },
        {
          id: "m4",
          sender: "staff",
          content: "Perfect! Our technician Mike will be there. You'll receive a notification before he arrives.",
          timestamp: "2023-08-27T10:25:00"
        },
        {
          id: "m5",
          sender: "system",
          content: "Appointment confirmed for Aug 28, 9:00 AM - 12:00 PM with Mike Johnson.",
          timestamp: "2023-08-27T10:25:30"
        },
        {
          id: "m6",
          sender: "system",
          content: "Technician Mike Johnson is on the way and will arrive in approximately 15 minutes.",
          timestamp: "2023-08-28T09:30:00"
        },
        {
          id: "m7",
          sender: "customer",
          content: "Thanks for the quick service! The AC is working great now.",
          timestamp: "2023-08-28T14:30:00"
        }
      ]
    },
    {
      id: "c2",
      name: "Sarah Wilson",
      avatar: null,
      lastMessage: "When can you schedule the annual maintenance for my HVAC system?",
      timestamp: "2023-08-27T16:45:00",
      unread: 2,
      messages: [
        {
          id: "m1",
          sender: "customer",
          content: "When can you schedule the annual maintenance for my HVAC system?",
          timestamp: "2023-08-27T16:45:00"
        }
      ]
    },
    {
      id: "c3",
      name: "Robert Brown",
      avatar: null,
      lastMessage: "Invoice #INV-2023-003 has been paid. Thank you!",
      timestamp: "2023-08-26T11:20:00",
      unread: 0,
      messages: [
        {
          id: "m1",
          sender: "system",
          content: "Invoice #INV-2023-003 has been paid. Thank you!",
          timestamp: "2023-08-26T11:20:00"
        }
      ]
    },
    {
      id: "c4",
      name: "Emily Davis",
      avatar: null,
      lastMessage: "I'll need a quote for replacing my current AC unit.",
      timestamp: "2023-08-25T15:10:00",
      unread: 1,
      messages: [
        {
          id: "m1",
          sender: "customer",
          content: "I'll need a quote for replacing my current AC unit.",
          timestamp: "2023-08-25T15:10:00"
        }
      ]
    },
    {
      id: "c5",
      name: "Michael Johnson",
      avatar: null,
      lastMessage: "What time is the technician arriving?",
      timestamp: "2023-08-24T09:05:00",
      unread: 0,
      messages: [
        {
          id: "m1",
          sender: "customer",
          content: "What time is the technician arriving?",
          timestamp: "2023-08-24T09:05:00"
        }
      ]
    }
  ];
  
  // Find the active conversation
  const activeChat = conversations.find((conv) => conv.id === activeConversation);
  
  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      // In a real app, you would add the message to the conversation and send it to the server
      // For this demo, we'll just clear the input
      setNewMessage("");
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const startDiscordScreenShare = () => {
    if (!discordServerName || !discordInviteLink) {
      toast.error("Please provide both server name and invite link");
      return;
    }

    // In a real implementation, you would use the Discord API
    // For now, we'll just open the invite link
    window.open(discordInviteLink, '_blank');
    toast.success(`Screen sharing session started for ${activeChat?.name}`);
    setIsDiscordDialogOpen(false);
  };

  const generateDiscordLink = () => {
    setIsDiscordDialogOpen(true);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
            <p className="text-muted-foreground">Communicate with customers and team members</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Message
          </Button>
        </div>
        
        <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-6 md:grid-cols-[300px_1fr]">
          {/* Conversations sidebar */}
          <div className="flex flex-col border rounded-md overflow-hidden">
            <div className="border-b p-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search messages..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Tabs defaultValue="all" className="px-3 pt-3">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="customers">Customers</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`cursor-pointer rounded-md p-2 transition-colors ${
                      conv.id === activeConversation
                        ? "bg-accent"
                        : "hover:bg-muted"
                    }`}
                    onClick={() => setActiveConversation(conv.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.avatar || undefined} alt={conv.name} />
                        <AvatarFallback>{getInitials(conv.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1 overflow-hidden">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{conv.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(conv.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <Badge className="ml-auto" variant="default">
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Conversation */}
          <Card className="flex flex-col">
            {activeChat ? (
              <>
                <CardHeader className="border-b p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{getInitials(activeChat.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{activeChat.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Customer</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" title="Call">
                        <PhoneCall className="h-4 w-4" />
                        <span className="sr-only">Call</span>
                      </Button>
                      <Button variant="ghost" size="icon" title="Email">
                        <AtSign className="h-4 w-4" />
                        <span className="sr-only">Email</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Discord Screen Share"
                        onClick={generateDiscordLink}
                      >
                        <Share2 className="h-4 w-4" />
                        <span className="sr-only">Screen Share</span>
                      </Button>
                      <Button variant="ghost" size="icon" title="Team Chat">
                        <Users className="h-4 w-4" />
                        <span className="sr-only">Group</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {activeChat.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender === "staff" ? "justify-end" : ""
                        }`}
                      >
                        {message.sender === "customer" && (
                          <Avatar className="mr-2 h-8 w-8">
                            <AvatarFallback>{getInitials(activeChat.name)}</AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.sender === "staff"
                              ? "bg-primary text-primary-foreground"
                              : message.sender === "customer"
                              ? "bg-muted"
                              : "bg-accent text-center italic text-muted-foreground text-sm w-full"
                          }`}
                        >
                          <p>{message.content}</p>
                          <div className="mt-1 text-xs opacity-70 text-right">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        
                        {message.sender === "staff" && (
                          <Avatar className="ml-2 h-8 w-8">
                            <AvatarFallback>AGA</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                
                <CardFooter className="border-t p-4">
                  <div className="flex w-full items-center gap-2">
                    <Button variant="outline" size="icon">
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Add Attachment</span>
                    </Button>
                    <Input
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} disabled={newMessage.trim() === ""}>
                      <Send className="h-4 w-4" />
                      <span className="sr-only">Send</span>
                    </Button>
                  </div>
                </CardFooter>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-4 p-8">
                <div className="rounded-full bg-primary/10 p-8">
                  <MessageCircle className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-medium">Select a conversation</h3>
                <p className="text-center text-muted-foreground">
                  Choose a conversation from the list or start a new one.
                </p>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" /> New Conversation
                </Button>
              </div>
            )}
          </Card>
        </div>
        
        {/* Discord integration dialog */}
        <Dialog open={isDiscordDialogOpen} onOpenChange={setIsDiscordDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Start Discord Screen Share</DialogTitle>
              <DialogDescription>
                Share your Discord server details to initiate a screen sharing session with {activeChat?.name}.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="discord-server">Discord Server Name</Label>
                <Input
                  id="discord-server"
                  value={discordServerName}
                  onChange={(e) => setDiscordServerName(e.target.value)}
                  placeholder="HVAC Tech Support"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="discord-invite">Discord Invite Link</Label>
                <Input
                  id="discord-invite"
                  value={discordInviteLink}
                  onChange={(e) => setDiscordInviteLink(e.target.value)}
                  placeholder="https://discord.gg/your-invite-code"
                />
                <p className="text-sm text-muted-foreground">
                  You can generate an invite link from your Discord server settings
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDiscordDialogOpen(false)}>Cancel</Button>
              <Button onClick={startDiscordScreenShare} className="gap-2">
                <Video className="h-4 w-4" />
                Start Screen Share
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Messages;
