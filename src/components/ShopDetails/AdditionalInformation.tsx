const AdditionalInformation = ({ additionalInformation }: any) => {
  return (
    <div>
      {additionalInformation.map((item: any, key: any) => (
        <div
          key={key}
          className="rounded-md even:bg-gray-1 flex py-4 px-4 sm:px-5"
        >
          <div className="max-w-[450px] min-w-[140px] w-full">
            <p className="text-sm sm:text-base text-dark">{item.name}</p>
          </div>
          <div className="w-full">
            <p className="text-sm sm:text-base text-dark">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdditionalInformation;
