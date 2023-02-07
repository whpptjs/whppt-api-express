import { OrderItemWithProduct } from 'src/modules/order/Models/Order';
import { layout } from './layout';

function getOrderItems(order: any) {
  if (order.items?.length) {
    let itemsHtml = '';
    const items = order.items;

    for (let item of items) {
      itemsHtml +=
        '<tr><td style="color:#ffffff;font-weight:500;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
        item.quantity.toString() +
        '</td><td style="color:#ffffff;font-weight:500;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
        (item?.product?.name || 'Legacy Item') +
        '</td><td style="color:#ffffff;font-weight:500;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
        '&nbsp;&nbsp;$' +
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

function getMemberDiscount(memberTotalDiscount: number) {
  return /* HTML */ `
    <tr>
      <th style=${getRowStyle()} scope="row" colspan="2">Member discount</th>
      <td style=${getRowStyle()}>- $${memberTotalDiscount.toFixed(2)}</td>
    </tr>
  `;
}

function getShippingDiscount(memberShippingDiscount: number) {
  return /* HTML */ `
    <tr>
      <th style=${getRowStyle()} scope="row" colspan="2">Shipping discount</th>
      <td style=${getRowStyle()}>- $${memberShippingDiscount.toFixed(2)}</td>
    </tr>
  `;
}

function getRowStyle() {
  return 'color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;';
}

export function getOrderTemplate(order: any) {
  const memberShippingDiscount = order?.payment?.memberShippingDiscount / 100 || 0;
  const memberTotalDiscount = order?.payment?.memberTotalDiscount / 100 || 0;
  const shipping = order?.payment?.shippingCost?.price / 100;
  const subtotal = getSubtotal(order);

  const template = /* HTML */ `
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="650"
      style="background-color: #242424">
      <tr>
        <td valign="top" style="padding: 35px;">
          <h2
            style="color:#ffffff;font-weight:500;font-size:24px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:10px">
            Order ${order.number || order._id},<br />
          </h2>
          <p
            style="color:#ACACAC;font-weight:normal;font-size:16px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:30px">
            ${order.updatedAt &&
            new Date(order.updatedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <table
            cellspacing="0"
            cellpadding="6"
            style="width: 100%; border: 1px solid #937a4a;"
            border="1"
            bordercolor="#937a4a">
            <thead>
              <tr>
                <th
                  scope="col"
                  style="color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;">
                  Product
                </th>
                <th
                  scope="col"
                  style="color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;">
                  Quantity
                </th>
                <th
                  scope="col"
                  style="color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              ${getOrderItems(order)}
            </tbody>
            <tfoot>
              <tr>
                <th style=${getRowStyle()} scope="row" colspan="2">Subtotal</th>
                <td style=${getRowStyle()}>&nbsp;&nbsp;$${subtotal.toFixed(2)}</td>
              </tr>
              ${memberTotalDiscount && getMemberDiscount(memberTotalDiscount)}
              <tr>
                <th style=${getRowStyle()} scope="row" colspan="2">Shipping</th>
                <td style=${getRowStyle()}>&nbsp;&nbsp;$${shipping.toFixed(2)}</td>
              </tr>
              ${memberShippingDiscount && getShippingDiscount(memberShippingDiscount)}
              <tr>
                <th scope="row" colspan="2" style=${getRowStyle()}>Total</th>
                <td style=${getRowStyle()}>
                  &nbsp;&nbsp;$${(
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
    </table>
  `;

  return layout(template, 'hentleyfarm.com/member/purchases');
}
