import axios from "axios";
import config from "../../config";
import prisma from "../../utils/prisma";
import { sslService } from "../SSL/ssl.service";
import { TInitPaymentData } from "../SSL/ssl.interface";
const initPaymentIntoDB = async (appointmentId: string) => {
  const paymentData = await prisma.payment.findFirstOrThrow({
    where: {
      appointmentId,
    },
    include: {
      appointment: {
        include: {
          patient: true,
        },
      },
    },
  });
  // console.log(paymentData);
  const initPaymentData = {
    amount: paymentData.amount,
    transactionId: paymentData.transactionId,
    name: paymentData.appointment.patient.name,
    email: paymentData.appointment.patient.email,
    address: paymentData.appointment.patient.address,
    phoneNumber: paymentData.appointment.patient.contactNumber,
  };

  const result = await sslService.initPayment(
    initPaymentData as TInitPaymentData
  );
  return {
    paymentUrl: result,
  };
};

const validatePayment = async (query: any) => {
  if (!query || query.status || !(query.status === "VALID")) {
    return {
      message: "Invalid payment",
    };
  }

  const response = await axios({
    method: "GET",
    url: `${config.sslCommerz.ssl_validation_api_url}?val_id=${query.val_id}&store_id=${config.sslCommerz.store_id}&store_passwd=${config.sslCommerz.store_pass}&format=json`,
  });
};

export const paymentService = {
  initPaymentIntoDB,
  validatePayment,
};
