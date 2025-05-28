import { IoSearch } from "react-icons/io5";
export function SearchBox() {
  return (
    <div className="SearchBox position-relative d-flex align-items-center">
      <IoSearch style={{ marginRight: "8px" }} />
      <input type="search" placeholder="Search Here" />
    </div>
  );
}
