import { env } from "$amplify/env/admin-create-user";
import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient
} from "@aws-sdk/client-cognito-identity-provider";
import { Schema } from "../../data/resource";

const client = new CognitoIdentityProviderClient()

type Handler = Schema['adminCreateUser']['functionHandler']
export const handler: Handler = async (event) => {
  try {
    const { phone, password } = event.arguments

    const command = new AdminCreateUserCommand({
      Username: phone,
      TemporaryPassword: password,
      UserAttributes: [
        {
          Name: 'phone_number',
          Value: phone
        },
        {
          Name: 'phone_number_verified',
          Value: 'true'
        }
      ],
      ValidationData: [
        {
          Name: 'phone_number',
          Value: phone
        },
      ],
      UserPoolId: env.AMPLIFY_AUTH_USERPOOL_ID,
    })
    const response = await client.send(command)

    return { content: response.User?.Username };
  } catch (error) {
    console.error("Creation error:", error);
    console.log("Event details:", event);
    throw new Error(`User creation failed: ${error}`);
  }
}