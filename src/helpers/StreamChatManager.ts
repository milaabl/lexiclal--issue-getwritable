import Cookies from "js-cookie";
import { ApiHelper, UserHelper } from ".";
import { ChatHelper } from "./ChatHelper";
import { ChatStateInterface, ConversationInterface, StreamConfigInterface, StreamingServiceExtendedInterface, StreamingServiceInterface } from "./interfaces";
import { SocketHelper } from "./SocketHelper";

export class StreamChatManager {

  public static async joinMainRoom(churchId: string, currentService: StreamingServiceExtendedInterface, setChatState:(state:ChatStateInterface) => void) {
    if (currentService) {
      const conversation: ConversationInterface = await ApiHelper.getAnonymous("/conversations/current/" + churchId + "/streamingLive/" + currentService.id, "MessagingApi");
      ChatHelper.current.mainRoom = ChatHelper.createRoom(conversation);
      ChatHelper.current.mainRoom.conversation.title = "Chat";
      setChatState(ChatHelper.current);
      ChatHelper.joinRoom(conversation.id, conversation.churchId);
      ChatHelper.current.mainRoom.joined = true;
    }
  }
  
  public static handleNameUpdate(displayName: string) {
    //const displayName = `${firstName} ${lastName}`
    const data = { socketId: SocketHelper.socketId, name: displayName };
    ApiHelper.postAnonymous("/connections/setName", data, "MessagingApi");
    ChatHelper.current.user.firstName = displayName;
    ChatHelper.current.user.lastName = "";
    Cookies.set("displayName", displayName);
    ChatHelper.onChange();
  }

  
  public static async checkHost(d: StreamConfigInterface, currentServiceId:string, chatState: ChatStateInterface, setChatState:(state: ChatStateInterface) => void) {
    if (chatState?.user?.isHost) {
      const hostChatDetails = await ApiHelper.get("/streamingServices/" + currentServiceId + "/hostChat", "ContentApi");
      if (hostChatDetails.room) {
        d.tabs.push({ type: "hostchat", text: "Host Chat", icon: "group", data: "", url: "" });
        const hostConversation: ConversationInterface = await ApiHelper.get("/conversations/current/" + d.churchId + "/streamingLiveHost/" + hostChatDetails.room, "MessagingApi");
        ChatHelper.current.hostRoom = ChatHelper.createRoom(hostConversation);
        ChatHelper.current.hostRoom.conversation.title = "Host Chat";
        setChatState(ChatHelper.current);
        setTimeout(() => {
          ChatHelper.joinRoom(hostConversation.id, hostConversation.churchId);
          ChatHelper.current.hostRoom.joined = true;
        }, 500);
      }
    }
  }

  public static initUser () {
    const chatUser = ChatHelper.getUser();
    if (ApiHelper.isAuthenticated) {
      const { firstName, lastName } = UserHelper.user;
      chatUser.firstName = firstName || "Anonymous";
      chatUser.lastName = lastName || "";
      ChatHelper.current.user = chatUser;
      ChatHelper.onChange();
    }
  }

}

