export type Delivery = {
  _id: string;
  aus_metro: {
    postcodes: string[];
    price: number | string | undefined;
    message?: string;
    allowCheckout: boolean;
  };
  aus_regional: {
    postcodes: string[];
    price: number | string | undefined;
    allowCheckout: boolean;
    message?: string;
  };
  international: {
    price: number | string | undefined;
    allowCheckout: boolean;
    message?: string;
  };
};
