export default function Divider({ text }) {
  return (
    <div className="d-flex align-items-center my-4 font-weight-light lh-1">
      <div style={{ flex: 1, height: "1px", backgroundColor: "#000000b3" }} />
      <span className="mx-3 muted">{text}</span>
      <div style={{ flex: 1, height: "1px", backgroundColor: "#000000b3" }} />
    </div>
  );
}
