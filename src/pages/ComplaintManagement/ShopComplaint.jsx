import { useParams } from "react-router-dom";
import ComplaintList from "./ComplaintList";

export default function ShopComplaint() {
  const { shopId } = useParams();
  // Delegate fetching and normalization to ComplaintList with provided shopId
  return <ComplaintList shopId={shopId} />;
}
