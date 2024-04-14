import axios from "axios";
import config from "../../config";
import prisma from "../../utils/prisma";
import { sslService } from "../SSL/ssl.service";
import { TInitPaymentData } from "../SSL/ssl.interface";
import { PaymentStatus } from "@prisma/client";
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
  // comment the ssl commerz validation code for check locally--------------
  //! TODO:-----------------------------
  // if (!query || !query.status || !(query.status === "VALID")) {
  //   return {
  //     message: "Invalid payment",
  //   };
  // }

  // // validate payment by function-------------
  // const response = await sslService.validatePayment(query);
  // if (response.status !== "VALID") {
  //   return {
  //     message: "Payment failed",
  //   };
  // }

  // it's fake
  const response = query;
  await prisma.$transaction(async (tx) => {
    const updatePaymentData = await tx.payment.update({
      where: {
        transactionId: response.tran_id,
      },
      data: {
        status: PaymentStatus.PAID,
        paymentGatewayData: response,
      },
    });

    await tx.appointment.update({
      where: {
        id: updatePaymentData.appointmentId,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
      },
    });
  });

  return {
    message: "Payment successful",
  };
};

export const paymentService = {
  initPaymentIntoDB,
  validatePayment,
};
