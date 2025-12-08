import { retrieveCart } from "@lib/data/cart"
import Header from "@components/Header"

export default async function Nav() {
  const cart = await retrieveCart().catch(() => null)

  return <Header cart={cart} />
}
