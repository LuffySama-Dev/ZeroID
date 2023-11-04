import crypto from "crypto";
import { CONTENT } from "@/constants";

const getUUID = (proof1: string) => {
  return crypto.randomUUID();
};

export async function POST(request: Request, response: Response) {
  try {
    const { aadhar, OTP } = await request.json();

    if (!aadhar || /^\d{12}$/.test(aadhar) === false) {
      // Return a "bad request" response code for invalid/missing aadhar numbers
      return new Response(
        JSON.stringify({ error: "Aadhar number was invalid or missing" }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }

    // Fetch OTP for aadhar from "database"
    const contentEntry = CONTENT.find(entry => entry.aadhar === aadhar);
    if (!contentEntry) {
      // Return a "not found" response code for invalid aadhar numbers
      return new Response(
        JSON.stringify({ error: "Aadhar number was not found" }),
        {
          status: 404,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }

    // If OTP is correct, return a "success" response code and return the content except the OTP
    const { otp: verifyOTP, ...content } = contentEntry;

    if (verifyOTP === OTP) {
      // Verifying from ZK
      const proof1 = "proof1";

      // Return uuid for proof1 through lookup in our supabase database
      const uuid = getUUID(proof1);

      return new Response(JSON.stringify({ uuid }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "OTP was invalid or missing" }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: {
        "content-type": "application/json",
      },
    });
  }
}
