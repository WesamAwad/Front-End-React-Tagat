export type WorkshopProfileFormValues = {
  shop_name: string;
  description: string;
  country_id: string;
  city_id: string;
  district_id: string;
  street: string;
  latitude: string;
  longitude: string;
  working_hours: string;
};

export const emptyWorkshopProfileForm: WorkshopProfileFormValues = {
  shop_name: "",
  description: "",
  country_id: "",
  city_id: "",
  district_id: "",
  street: "",
  latitude: "",
  longitude: "",
  working_hours: "",
};
