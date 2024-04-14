import axios from "axios";
import config from "../../config";
import { TInitPaymentData } from "./ssl.interface";
import AppError from "../../errors/appError";
import httpStatus from "http-status";

const initPayment = async (paymentData: TInitPaymentData) => {
  try {
    const data = {
      store_id: config.sslCommerz.store_id,
      store_passwd: config.sslCommerz.store_pass,
      total_amount: paymentData?.amount,
      currency: "BDT",
      tran_id: paymentData.transactionId, // use unique tran_id for each api call
      success_url: config.sslCommerz.success_url,
      fail_url: config.sslCommerz.fail_url,
      cancel_url: config.sslCommerz.cancel_url,
      ipn_url: "http://localhost:3030/ipn",
      shipping_method: "N/A",
      product_name: "Appointment",
      product_category: "Service",
      product_profile: "general",
      cus_name: paymentData.name,
      cus_email: paymentData.email,
      cus_add1: paymentData.address,
      cus_add2: "N/A",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: paymentData.phoneNumber,
      cus_fax: "01711111111",
      ship_name: "N/A",
      ship_add1: "N/A",
      ship_add2: "N/A",
      ship_city: "N/A",
      ship_state: "N/A",
      ship_postcode: 1000,
      ship_country: "Bangladesh",
    };

    // use axios for api fetch
    const response = await axios({
      method: "POST",
      url: config.sslCommerz.ssl_payment_api_url,
      data: data,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response?.data?.GatewayPageURL;
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment error occurred");
  }
};

const validatePayment = async (query: any) => {
  try {
    const response = await axios({
      method: "GET",
      url: `${config.sslCommerz.ssl_validation_api_url}?val_id=${query.val_id}&store_id=${config.sslCommerz.store_id}&store_passwd=${config.sslCommerz.store_pass}&format=json`,
    });

    return response.data;
  } catch (error) {
    throw new AppError(httpStatus.BAD_REQUEST, "Payment validation failed");
  }
};

export const sslService = {
  initPayment,
  validatePayment,
};
