import { Metadata } from "next"
import Hero from "@components/Home/Hero"
import FaqSection from "@components/Home/Faq"
import Newsletter from "@components/Common/Newsletter"
import { getFAQ } from "../../lib/data/local-data"

export const metadata: Metadata = {
  title: "ZDAComm | Store",
  description: "This is Home for ZDAComm Store",
}

export default async function HomePage() {
  const faqData = await getFAQ()

  return (
    <main className="pt-20">
      <Hero />
      <FaqSection faqData={faqData} />
      <Newsletter />
    </main>
  )
}

