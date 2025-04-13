export default function reactionListSetter(initialReactions, userReaction) {
  // Додати "thumbs_up" і "thumbs_down", якщо їх немає
  let resultReactions = [...initialReactions];
  const hasThumbsUp = resultReactions.some(
    reaction => reaction.name === "thumbs_up"
  );
  const hasThumbsDown = resultReactions.some(
    reaction => reaction.name === "thumbs_down"
  );

  if (!hasThumbsUp)
    resultReactions.push({ icon: "👍", name: "thumbs_up", count: 0 });
  if (!hasThumbsDown)
    resultReactions.push({ icon: "👎", name: "thumbs_down", count: 0 });

  resultReactions = resultReactions.sort((a, b) => {
    const order = ["thumbs_up", "thumbs_down"];
    const indexA = order.indexOf(a.name);
    const indexB = order.indexOf(b.name);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    else if (indexA !== -1) return -1;
    else if (indexB !== -1) return 1;
    return b.count - a.count;
  });

  // Додати прапорець active для реакції користувача
  resultReactions = resultReactions.map(reaction => {
    if (reaction.name === userReaction) {
      return { ...reaction, active: true };
    }
    return reaction;
  });
  return resultReactions;
}
