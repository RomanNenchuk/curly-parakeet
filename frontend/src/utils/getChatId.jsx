export default function getChatId(senderId, receiverId) {
  return [senderId, receiverId].sort((a, b) => a.localeCompare(b)).join("_");
}
