/* Crema Collective – screen navigation + simple state */
const COFFEES = [
  { id: 1, name: 'Caffe Mocha',  sub: 'Deep Foam', cat: 'Machiato', price: 4.53, img: 'assets/images/mocha.jpg' },
  { id: 2, name: 'Flat White',   sub: 'Espresso',  cat: 'Latte',    price: 3.53, img: 'assets/images/flat-white.jpg' },
  { id: 3, name: 'Mocha Fusi',   sub: 'Ice/Hot',   cat: 'Americano',price: 7.53, img: 'assets/images/mocha.jpg' },
  { id: 4, name: 'Caffe Panna',  sub: 'Ice/Hot',   cat: 'Latte',    price: 5.53, img: 'assets/images/flat-white.jpg' },
];
const CATS = ['All Coffee', 'Machiato', 'Latte', 'Americano'];
const SIZE_DELTA = { S: -1, M: 0, L: 1 };
const DELIVERY_FEE = 1.0;

const state = { cat: 'All Coffee', query: '', item: COFFEES[0], size: 'M', qty: 1, cart: 0 };
const $ = (s) => document.querySelector(s);
const money = (n) => `$ ${n.toFixed(2).replace(/\.00$/, '.0')}`;
const unitPrice = () => state.item.price + SIZE_DELTA[state.size];

function go(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  if (id === 'order') renderOrder();
}

function renderChips() {
  $('#chips').innerHTML = CATS.map((c) =>
    `<button class="${c === state.cat ? 'on' : ''}" data-cat="${c}">${c}</button>`).join('');
}

function renderGrid() {
  const q = state.query.toLowerCase();
  const list = COFFEES.filter((c) =>
    (state.cat === 'All Coffee' || c.cat === state.cat) && c.name.toLowerCase().includes(q));
  $('#grid').innerHTML = list.map((c) => `
    <div class="card" data-id="${c.id}" role="button" tabindex="0">
      <div class="pic"><img src="${c.img}" alt="${c.name}"empty><span class="star">★ 4.8</span></div>
      <h5>${c.name}</h5><small>${c.sub}</small>
      <div class="foot"><b>${money(c.price)}</b><button class="add" data-add="${c.id}" aria-label="Add ${c.name}">+</button></div>
    </div>`).join('') || '<p style="grid-column:1/-1;text-align:center;color:var(--muted)">No coffee found</p>';
}

function openDetail(item) {
  state.item = item; state.size = 'M'; state.qty = 1;
  $('#d-name').textContent = item.name;
  $('#d-img').src = item.img; $('#d-img').style.visibility = 'visible';
  document.querySelectorAll('#sizes button').forEach((b) => b.classList.toggle('on', b.textContent === 'M'));
  $('#d-price').textContent = money(unitPrice());
  go('detail');
}

function renderOrder() {
  const sub = unitPrice() * state.qty;
  $('#o-name').textContent = state.item.name;
  $('#o-img').src = state.item.img; $('#o-img').style.visibility = 'visible';
  $('#qty').textContent = state.qty;
  $('#o-price').textContent = money(sub);
  $('#o-total').textContent = money(sub + DELIVERY_FEE);
}

/* Events */
document.addEventListener('click', (e) => {
  const t = e.target.closest('button, .card'); if (!t) return;
  if (t.dataset.go) return go(t.dataset.go);
  if (t.dataset.cat) { state.cat = t.dataset.cat; renderChips(); return renderGrid(); }
  if (t.dataset.add) {
    state.cart++; const b = $('#badge'); b.hidden = false; b.textContent = state.cart; return;
  }
  if (t.classList.contains('card')) return openDetail(COFFEES.find((c) => c.id == t.dataset.id));
  if (t.closest('#sizes')) {
    state.size = t.textContent;
    document.querySelectorAll('#sizes button').forEach((b) => b.classList.toggle('on', b === t));
    $('#d-price').textContent = money(unitPrice());
  }
  if (t.closest('#seg')) document.querySelectorAll('#seg button').forEach((b) => b.classList.toggle('on', b === t));
  if (t.id === 'plus') { state.qty++; renderOrder(); }
  if (t.id === 'minus' && state.qty > 1) { state.qty--; renderOrder(); }
  if (t.id === 'fav') t.textContent = t.textContent === '♡' ? '♥' : '♡';
});
$('#search').addEventListener('input', (e) => { state.query = e.target.value; renderGrid(); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.classList.contains('card')) e.target.click();
});

renderChips(); renderGrid();

/* Image fallback: tries jpg / png / jpeg / webp automatically */
document.addEventListener('error', (e) => {
  const i = e.target;
  if (i.tagName !== 'IMG' || !i.getAttribute('src')) return;
  const m = i.getAttribute('src').match(/^(.*)\.\w+$/); if (!m) return;
  if (i.dataset.base !== m[1]) { i.dataset.base = m[1]; i.dataset.n = 0; }
  const next = ['jpg', 'png', 'jpeg', 'webp'][+i.dataset.n];
  if (next) { i.dataset.n = +i.dataset.n + 1; i.src = `${m[1]}.${next}`; }
  else i.style.visibility = 'hidden';
}, true);