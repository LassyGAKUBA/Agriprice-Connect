const data = [
  { crop: "Beans", price: "800 RWF/kg" },
  { crop: "Maize", price: "500 RWF/kg" },
  { crop: "Rice", price: "1200 RWF/kg" },
  { crop: "Potatoes", price: "400 RWF/kg" }
];

const list = document.getElementById("priceList");

function display(items) {
  list.innerHTML = "";
  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item.crop + " - " + item.price;
    list.appendChild(li);
  });
}

display(data);

document.getElementById("search").addEventListener("input", function() {
  const value = this.value.toLowerCase();
  const filtered = data.filter(item =>
    item.crop.toLowerCase().includes(value)
  );
  display(filtered);
});

document.getElementById("updated").textContent =
  "Last Updated: " + new Date().toDateString();