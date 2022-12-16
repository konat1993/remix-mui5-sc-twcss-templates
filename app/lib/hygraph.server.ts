// app/lib/hygraph.server.ts

import { GraphQLClient } from "graphql-request";

const endpoint = process.env.hygraph_ENDPOINT as string;

export const hygraph = new GraphQLClient(endpoint);