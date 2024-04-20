import Dialog from "@/components/Dialog";
import { signingMessage } from "@/services/auth";
import { Button } from "@chakra-ui/react";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { ReactNode, useEffect, useState } from "react";
import { SiweMessage, generateNonce } from "siwe";
import { useAccount, useDisconnect, useSignMessage } from "wagmi";

const ConnectWalletButton = ({
  className: className = "",
  children,
  disabled,
  onClick: onClick = () => {},
  onSuccess: onSuccess = () => {},
  onError: onError = () => {},
}: {
  name?: string;
  disabled?: boolean;
  children?: ReactNode;
  className?: string;
  onClick?: () => void;
  onSuccess?: (message: SiweMessage, signature: string) => void;
  onError?: () => void;
}) => {
  const { address, isConnected, isConnecting } = useAccount();
  const { connectModalOpen } = useConnectModal();
  const { disconnect } = useDisconnect();
  const [walletDialog, setWalletDialog] = useState<JSX.Element | null>(null);
  const [message, setMessage] = useState<SiweMessage | null>(null);
  const [nonce, setNonce] = useState("");
  const [showConfirmAddress, setShowConfirmAddress] = useState(false);
  const [active, setActive] = useState(false);

  const {
    data: signature,
    isSuccess: isSigned,
    error: signError,
    signMessage,
  } = useSignMessage();

  useEffect(() => {
    if (signError) {
      onError();
    }
  }, [signError]);

  useEffect(() => {
    setActive(connectModalOpen);
  }, [connectModalOpen]);

  useEffect(() => {
    if (isSigned && signature && message) {
      verifySignature(message, signature, nonce).then((verified) => {
        if (verified) {
          onSuccess(message, signature);
        } else {
          onError();
        }
      });
    }
  }, [isSigned, signature, message]);

  useEffect(() => {
    disconnect();
  }, []);

  const verifySignature = async (
    message: SiweMessage,
    signature: string,
    nonce: string
  ) => {
    try {
      await message.verify({
        signature,
        nonce,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const reset = () => {
    setShowConfirmAddress(false);
    setWalletDialog(null);
    setMessage(null);
    setNonce("");
  };

  const cancel = () => {
    reset();
    disconnect();
    onError();
  };

  async function onConfirmWallet() {
    setShowConfirmAddress(false);
    await handleSignMessage(address);
  }

  const handleSignMessage = async (
    address?: string
  ): Promise<SiweMessage | null> => {
    if (!address) return null;
    const nonce = generateNonce();
    const message = await signingMessage(address, nonce);
    setNonce(nonce);
    setMessage(message);
    await signMessage({ message: message.prepareMessage() });
    return message;
  };

  const handleOpenConnectModal = (
    connected: boolean,
    openConnectModal: () => void
  ) => {
    if (!connected) {
      onClick();
      openConnectModal();
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      setShowConfirmAddress(true);
    }
  }, [isConnected, address]);

  return (
    <>
      <ConnectButton.Custom>
        {({ account, chain, openConnectModal, mounted }) => {
          const ready = mounted;
          const connected = !!(ready && account && chain);
          return (
            <>
              <Button
                variant="ghost"
                className={"min-w-fit " + className}
                onClick={() => {
                  handleOpenConnectModal(
                    connected || isConnected,
                    openConnectModal
                  );
                }}
                isDisabled={disabled}
                isLoading={active && (isConnecting || !ready)}
                padding={0}
              >
                {children}
              </Button>
            </>
          );
        }}
      </ConnectButton.Custom>
      <Dialog
        isCentered
        size="lg"
        title="CONFIRM WALLET"
        isOpen={showConfirmAddress}
        onClose={() => setShowConfirmAddress(false)}
      >
        <div className="flex flex-col gap-6 font-bold text-center">
          <div className="text-lg uppercase">
            You are connecting the following address:
          </div>
          <div className="bg-slate-200 rounded-3xl px-2 py-1">{address}</div>
          <div className="flex flex-row justify-between">
            <Button onClick={cancel}>Cancel</Button>
            <Button onClick={onConfirmWallet} disabled={!address}>
              Confirm
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ConnectWalletButton;
