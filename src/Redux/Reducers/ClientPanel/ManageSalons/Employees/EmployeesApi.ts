import { baseApi } from "@/Redux/Api/BaseApi";

export const EmployeesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmployeesData: builder.query({
      // Accepts { salonUid, page?, page_size?, search? } and forwards them as query params
      query: ({
        salonUid,
        page,
        page_size,
        search,
      }: {
        salonUid: string;
        page?: number;
        page_size?: number;
        search?: string;
      }) => {
        return {
          url: `/salons/${salonUid}/employees`,
          method: "GET",
          // fetchBaseQuery will pick up `params` and serialize them into the URL
          params: {
            ...(page ? { page } : {}),
            ...(page_size ? { page_size } : {}),
            ...(search ? { search } : {}),
          },
        };
      },
      providesTags: ["Employees"],
    }),
    addEmployee: builder.mutation({
      query: ({ salonUid, employeeData }) => ({
        url: `/salons/${salonUid}/employees`,
        method: "POST",
        body: employeeData,
      }),
      invalidatesTags: ["Employees", "Bookings"],
    }),
    editEmployee: builder.mutation({
      query: ({ salonUid, employeeData, employeeUid }) => ({
        url: `/salons/${salonUid}/employees/${employeeUid}`,
        method: "PATCH",
        body: employeeData,
      }),
      invalidatesTags: ["Employees", "Bookings"],
    }),
    deleteEmployee: builder.mutation({
      query: ({ salonUid, employeeUid }) => ({
        url: `/salons/${salonUid}/employees/${employeeUid}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Employees", "Bookings"],
    }),
  }),
});

export const {
  useGetEmployeesDataQuery,
  useAddEmployeeMutation,
  useEditEmployeeMutation,
  useDeleteEmployeeMutation,
} = EmployeesApi;
