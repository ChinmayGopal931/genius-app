type ActionIconProps = {
  action: string;
};

const ActionIcon = ({ action }: ActionIconProps) => {
  const createImage = () => {
    switch (action) {
      case "USDC":
        return "/assets/USDC.svg";
      case "stUSD":
        return "/assets/stUSD.svg";
      default:
        break;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <img src={createImage()} alt="" className="w-8 h-8" />
    </div>
  );
};

export default ActionIcon;
