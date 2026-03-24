import Link from "next/link";
import React from "react";

export default function Hospital() {
  return (
    <div>
      Hospital
      <Link
        href={"/dashboard/hospital/requests"}
        className="bg-[#bbb] cursor-pointer p-3 inline-block"
      >
        Request
      </Link>
      <Link
        href={"/dashboard/hospital/staffs"}
        className="bg-[#bbb] cursor-pointer p-3 inline-block"
      >
        Staffs
      </Link>
    </div>
  );
}
