const data = [
  { crop: "Beans", price: 800 },
  { crop: "Maize", price: 500 },
  { crop: "Rice", price: 1200 },
  { crop: "Potatoes", price: 400 }
];

const list = document.getElementById("priceList");
const noResults = document.getElementById("noResults");

function getTag(price) {
  if (price <= 500) return "low";
  if (price <= 900) return "medium";
  return "high";
}

function display(items) {
  list.innerHTML = "";

  if (items.length === 0) {
    noResults.style.display = "block";
    return;
  } else {
    noResults.style.display = "none";
  }

  items.forEach(item => {
    const li = document.createElement("li");

    const tagClass = getTag(item.price);

    li.innerHTML = `
      ${item.crop} - ${item.price} RWF/kg
      <span class="tag ${tagClass}">
        ${tagClass.toUpperCase()}
      </span>
    `;

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