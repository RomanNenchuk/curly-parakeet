export default function convertLinks(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.split(urlRegex).map((part, index) =>
    urlRegex.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          backgroundColor: "#ffff002f",
          padding: "2px",
          borderRadius: "3px",
        }}
      >
        {part}
      </a>
    ) : (
      part
    )
  );
}
