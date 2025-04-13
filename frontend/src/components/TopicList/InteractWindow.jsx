import React, { useRef } from "react";

export default function InteractWindow({ reactionList, onClick }) {
  return (
    <div className="outer-interact">
      <div className="inner-interact">
        {reactionList.map((reaction, index) => (
          <span key={index} onClick={() => onClick(reaction)}>
            {reaction.icon}
          </span>
        ))}
      </div>
    </div>
  );
}
