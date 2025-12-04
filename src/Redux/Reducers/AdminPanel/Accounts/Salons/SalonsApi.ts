import { baseApi } from "@/Redux/Api/BaseApi";

export const SalonsListApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSalonList: build.query({
      query: ({ params, accountUid }) => ({
        url: `/admin/accounts/${accountUid}/salons`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonsList"],
    }),
    getSalonDetails: build.query({
      query: ({ accountUid, salonUid }) => ({
        url: `/admin/accounts/${accountUid}/salons/${salonUid}`,
        method: "GET",
      }),
      providesTags: ["SalonsList"],
    }),
    getSalonServices: build.query({
      query: ({ accountUid, salonUid, params }) => ({
        url: `/admin/accounts/${accountUid}/salons/${salonUid}/services`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonsList"],
    }),
    getSalonProducts: build.query({
      query: ({ accountUid, salonUid, params }) => ({
        url: `/admin/accounts/${accountUid}/salons/${salonUid}/products`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonsList"],
    }),
    getSalonEmployees: build.query({
      query: ({ accountUid, salonUid, params }) => ({
        url: `/admin/accounts/${accountUid}/salons/${salonUid}/employees`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonsList"],
    }),
    getSalonBookings: build.query({
      query: ({ accountUid, salonUid, params }) => ({
        url: `/admin/accounts/${accountUid}/salons/${salonUid}/bookings`,
        method: "GET",
        params,
      }),
      providesTags: ["SalonsList"],
    }),
  }),
});

export const {
  useGetSalonListQuery,
  useGetSalonDetailsQuery,
  useGetSalonServicesQuery,
  useGetSalonProductsQuery,
  useGetSalonEmployeesQuery,
  useGetSalonBookingsQuery,
} = SalonsListApi;
