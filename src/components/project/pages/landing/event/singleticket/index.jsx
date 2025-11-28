import DirectRegister from "../register/direct";

export const SingleTicket = ({ setLoaderBox, event, ticket }) => {
  return (
    ticket && (
      <DirectRegister
        setLoaderBox={setLoaderBox}
        ticket={ticket}
        single={true}
        registserHandler={(e) => {
          document.body.style.overflow = "";
        }}
        event={event}
      />
    )
  );
};
