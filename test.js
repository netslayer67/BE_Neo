const product = {
    "_id": "64b598302bfa21e974d4105a",
    "name": "Neo",
    "description": "test product",
    "price": 5000,
    "sizes": [
        {
            "size": "XL",
            "stock": 6,
            "_id": "64b598302bfa21e974d4105b"
        },
        {
            "size": "L",
            "stock": 1,
            "_id": "64b598302bfa21e974d4105c"
        },
        {
            "size": "S",
            "stock": 0,
            "_id": "64b598302bfa21e974d4105d"
        }
    ],
    "imageUrl": "1689622576017msg1384733885-26746.png",
    "totalStock": 8,
    "__v": 0
};

const sizeName = "S";
const selectedSize = product.sizes.find((size) => size.size === sizeName);
console.log(selectedSize);