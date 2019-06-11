function readAssetAloud(asset) {
    console.log(asset);
};

var assets = [
    "pic1.svg",
    'pic2.jpg',
    'pic3.png',
    "http://placekitten.com/400/400",
    "http://placekitten.com/400/401",
    "http://placekitten.com/400/402",
];

assets.forEach(asset => readAssetAloud(asset));

function readLinkAloud(link) {
    console.log(link);
};

var links = [
    "/about",
    '/blog',
    '/index',
    "http://placekitten.com/400/400",
    "http://placekitten.com/400/401",
    "http://placekitten.com/400/402",
];

links.forEach(link => readLinkAloud(link));
