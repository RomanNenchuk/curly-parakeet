import { Link } from "react-router-dom";
export default function NavLink({
  label,
  linkText,
  linkTo,
  backgroundPath,
  redirectPath,
  className,
}) {
  return (
    <div className={`text-black my-2 ${className || ""}`}>
      {label ? label + " " : ""}
      <Link
        style={{ color: "#659287" }}
        to={linkTo}
        state={{ backgroundLocation: backgroundPath, redirectPath }}
        replace
      >
        {linkText}
      </Link>
    </div>
  );
}
