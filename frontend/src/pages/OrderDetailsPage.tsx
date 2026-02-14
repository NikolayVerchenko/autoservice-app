import { useParams } from 'react-router-dom';

export function OrderDetailsPage() {
  const { id } = useParams();
  return <div className="rounded border bg-white p-4">Карточка заказ-наряда: {id}</div>;
}
