import { prisma } from "@/lib/prismaDB";

export async function validateCoupon(code: string) {
  try {

    if (!code) {
      return {
        success: false,
        message: "Coupon code is required",
      };
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code,
      }
    });

    if (!coupon) {
      return {
        success: false,
        message: "Coupon not found",
      };
    }

    if (coupon.timesRedemed >= coupon.maxRedemptions) {
      return {
        success: false,
        message: "Coupon has been redeemed too many times",
      };
    }

    return {
      success: true,
      data: {
        discount: coupon.discount,
        code: coupon.code,
      },
    }
  } catch (error: any) {
    console.log("Error validating coupon:", error?.stack || error);
    return {
      success: false,
      message: "Failed to validate coupon",
    };
  }
}