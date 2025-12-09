"use client"

import { HttpTypes } from "@medusajs/types"
import Accordion from "./accordion"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

const ProductTabs = ({ product }: ProductTabsProps) => {
  const metadata = (product.metadata || {}) as Record<string, any>
  const productType = metadata.productType || ""
  
  // Extract metadata fields
  const description = metadata.description || ""
  const specifications = metadata.specifications || ""
  const features = metadata.features || []
  const applications = metadata.applications || []

  const tabs = [
    {
      label: "Description",
      component: <DescriptionTab description={description} product={product} />,
    },
    {
      label: "Specifications",
      component: <SpecificationsTab specifications={specifications} features={features} applications={applications} productType={productType} />,
    },
  ]

  return (
    <div className="w-full">
      <Accordion type="multiple">
        {tabs.map((tab, i) => (
          <Accordion.Item
            key={i}
            title={tab.label}
            headingSize="medium"
            value={tab.label}
          >
            {tab.component}
          </Accordion.Item>
        ))}
      </Accordion>
    </div>
  )
}

const DescriptionTab = ({ description, product }: { description: string; product: HttpTypes.StoreProduct }) => {
  // Use product's original description field (not metadata description)
  const displayDescription = product.description || "No description available."

  return (
    <div className="text-small-regular py-8">
      <div className="prose max-w-none">
        <p className="text-[#383838] text-[18px] font-normal leading-7 whitespace-pre-line">
          {displayDescription}
        </p>
      </div>
    </div>
  )
}

const SpecificationsTab = ({ 
  specifications, 
  features, 
  applications, 
  productType 
}: { 
  specifications: string
  features: string[]
  applications: string[]
  productType: string
}) => {
  return (
    <div className="text-small-regular py-8">
      <div className="flex flex-col gap-6">
        {/* Specifications Text */}
        {specifications && (
          <div>
            <h3 className="text-[#2958A4] text-[24px] font-semibold mb-4">Specifications</h3>
            <p className="text-[#383838] text-[18px] font-normal leading-7 whitespace-pre-line">
              {specifications}
            </p>
          </div>
        )}

        {/* Features Section (Antenna & Cable) */}
        {features.length > 0 && (
          <div>
            <h3 className="text-[#2958A4] text-[24px] font-semibold mb-4">Features</h3>
            <ul className="flex flex-col gap-2">
              {features.map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-black text-[16px] leading-6 mt-1">•</span>
                  <span className="text-black text-[16px] font-medium leading-[26px]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Applications Section (Antenna only) */}
        {productType === "antenna" && applications.length > 0 && (
          <div>
            <h3 className="text-[#2958A4] text-[24px] font-semibold mb-4">Application</h3>
            <ul className="flex flex-col gap-2">
              {applications.map((application: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-black text-[16px] leading-6 mt-1">•</span>
                  <span className="text-black text-[16px] font-medium leading-[26px]">
                    {application}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductTabs
