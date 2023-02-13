import { HttpModule } from './../HttpModule';
import { Secure } from '../staff/Secure';
import buildPdf from './buildPdf';
import { loadOrderWithProducts } from '../order/Queries/loadOrderWithProducts';

const create: HttpModule<any, {}> = {
  exec(context, { orderIds }: { orderIds: string[] }) {
    const ordersWithProductInfo: any = [];

    Promise.all([
      ...orderIds.map(orderId => {
        return loadOrderWithProducts(context, { _id: orderId }).then(orderWithProducts =>
          ordersWithProductInfo.push(...orderWithProducts.items)
        );
      }),
    ]).then(() => {
      return createPdfBinary(
        {
          products: ordersWithProductInfo.map((product: any) => {
            return {
              name: product.product?.name,
              vintage: product.product?.vintage,
              quantity: product.quantity,
            };
          }),
        },
        () => {}
      );
    });

    return Promise.resolve({});
  },
};

export default Secure(create);

//@ts-ignore
const createPdfBinary = ({ products }: { products: any }, callback: any) => {
  const doc = buildPdf({ products });

  const chunks: any = [];
  let result;

  doc.on('data', function (chunk: any) {
    chunks.push(chunk);
  });
  doc.on('end', function () {
    result = Buffer.concat(chunks);
    callback(result);
  });
  doc.end();
};
