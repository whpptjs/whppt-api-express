import { OrderItemWithProduct } from 'src/modules/order/Models/Order';
import { footer, headers } from './layoutTemplates';

function getOrderItems(order: any) {
  if (order.items?.length) {
    let itemsHtml = '';
    const items = order.items;

    for (let item of items) {
      itemsHtml +=
        '<tr><td style="color:#242424;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
        item.quantity.toString() +
        '</td><td style="color:#242424;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
        (item?.product?.name || 'Legacy Item') +
        '</td><td style="color:#242424;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
        ((item.purchasedPrice || item?.product?.price) / 100).toFixed(2).toString() +
        '</td></tr>';
    }

    return itemsHtml;
  }
}

function getSubtotal(order: any) {
  return order && order.items.length
    ? order.items.reduce(
        (acc: number, item: OrderItemWithProduct) =>
          acc +
          (Number(item?.purchasedPrice || item.product?.price || 0) / 100) *
            Number(item.quantity),
        0
      )
    : 0;
}

function getStyle(discount: number) {
  let basicStyle = 'text-align:left;border:1pxsolid#937a4a;';
  basicStyle += !!discount ? 'color:#4BB543;' : '';
  return basicStyle;
}

export function getOrderTemplate(order: any) {
  const memberShippingDiscount = order?.payment?.memberShippingDiscount / 100 || 0;
  const memberTotalDiscount = order?.payment?.memberTotalDiscount / 100 || 0;
  const shipping = order?.payment?.shippingCost?.price
    ? order?.payment?.shippingCost?.price / 100 - memberShippingDiscount
    : 0;
  const subtotal = getSubtotal(order) - memberTotalDiscount;

  return `
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="800"
      style="background-color: #F6F6F4">
      ${headers('Invoice')}
      <tr>
        <td valign="top" style="padding: 35px;">
          <h2
            style="color:#9D7837;font-weight:bold;font-size:24px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:10px">
            Order ${order.number || order._id},<br />
          </h2>
          <p
            style="color:#ACACAC;font-weight:normal;font-size:16px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:30px">
            ${
              order.updatedAt &&
              new Date(order.updatedAt).toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })
            }
          </p>
          <table
            cellspacing="0"
            cellpadding="6"
            style="width: 100%; border: 1px solid #937a4a;"
            border="1"
            bordercolor="#937a4a">
            <thead>
              <tr>
                <th scope="col" style="text-align:left; border: 1px solid #937a4a;">
                  Product
                </th>
                <th scope="col" style="text-align:left; border: 1px solid #937a4a;">
                  Quantity
                </th>
                <th scope="col" style="text-align:left; border: 1px solid #937a4a;">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              ${getOrderItems(order)}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row" colspan="2" style=${getStyle(memberTotalDiscount)}>
                  ${
                    memberTotalDiscount
                      ? `Subtotal - (Member discount on items: ${memberTotalDiscount})`
                      : 'Subtotal'
                  }
                </th>
                <td style=${getStyle(memberTotalDiscount)}>${subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <th scope="row" colspan="2" style=${getStyle(memberShippingDiscount)}>
                  ${
                    memberShippingDiscount
                      ? `Shipping - (Member shipping discount: $${memberShippingDiscount.toFixed(
                          2
                        )})`
                      : 'Shipping'
                  }
                </th>
                <td style=${getStyle(memberShippingDiscount)}>${shipping.toFixed(2)}</td>
              </tr>
              <tr>
                <th
                  scope="row"
                  colspan="2"
                  style="text-align:left; font-weight:bold; font-size:16px; border: 1px solid #937a4a;">
                  Total
                </th>
                <td
                  style="text-align:left; font-weight:bold; font-size:16px; border: 1px solid #937a4a;">
                  ${(
                    subtotal +
                    shipping -
                    memberTotalDiscount -
                    memberShippingDiscount
                  ).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </td>
      </tr>
      ${footer}
    </table>
  `;
}
