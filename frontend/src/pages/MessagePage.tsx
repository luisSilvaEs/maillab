import { useParams } from "react-router-dom";

const MessagePage = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Message</h1>
      <p className="mt-1 text-sm text-gray-500">
        MessagePage — placeholder — id: <code>{id}</code>
      </p>
    </div>
  );
};

export default MessagePage;
