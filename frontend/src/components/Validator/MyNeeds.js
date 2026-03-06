import React from "react";
import NeedCard from "./NeedCard";

const MyNeeds = ({ needs }) => {
  return (
    <div>
      {needs.length === 0 ? (
        <p>Aucun besoin trouvé.</p>
      ) : (
        needs.map((need) => <NeedCard key={need.id} need={need} />)
      )}
    </div>
  );
};

export default MyNeeds;