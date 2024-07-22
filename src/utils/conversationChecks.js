export const isOlderThan24Hours = (conversation) => {
  // non ci sono messaggi (questo non si verificherà mai in teoria in quanto verrà inviato mess simultaneamente a creazione di una conversazione)
  if (!conversation.messages.length) return true;
  // ultimo messaggio è più vecchio di 48 ore
  const lastMessageDate = new Date(
    conversation.messages[conversation.messages.length - 1].dateCreated
  );
  const now = new Date();
  const hoursDifference = (now - lastMessageDate) / (1000 * 60 * 60);
  return hoursDifference > 24;
};
