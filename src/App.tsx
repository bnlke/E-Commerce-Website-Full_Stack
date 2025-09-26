import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { CartProvider } from './contexts/CartContext';
import { SearchProvider } from './contexts/SearchContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import AdminRoute from './components/AdminRoute';
import Dashboard from './pages/admin/Dashboard';
import { AuthProvider } from './contexts/AuthContext';
import Profile from './pages/Profile';
import { loadStripe } from '@stripe/stripe-js';

// Page imports
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Favorites from './pages/Favorites';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';

// Support Pages
import Contact from './pages/support/Contact';
import FAQs from './pages/support/FAQs';
import SizeGuide from './pages/support/SizeGuide';
import Shipping from './pages/support/Shipping';
import Help from './pages/Help';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Unsubscribe from './pages/support/Unsubscribe';
import TermsOfService from './pages/legal/TermsOfService';
import CookiePolicy from './pages/legal/CookiePolicy';

// Company Pages
import About from './pages/company/About';
import Sustainability from './pages/company/Sustainability';
import Careers from './pages/company/Careers';
import Press from './pages/company/Press';
import Partners from './pages/company/Partners';

// Category Landing Pages
import CategoryMen from './pages/CategoryMen';
import CategoryWomen from './pages/CategoryWomen';
import CategoryKids from './pages/CategoryKids';
import CategorySocks from './pages/CategorySocks';
import CategoryAccessories from './pages/CategoryAccessories';
import CategorySale from './pages/CategorySale';

// Product Details
import ProductDetails from './pages/ProductDetails';
import WoolRunnerGo from './pages/products/WoolRunnerGo';

// Men's Routes
import MensTrainers from './pages/men/MensTrainers';
import MensActiveShoes from './pages/men/MensActiveShoes';
import MensWaterRepellent from './pages/men/MensWaterRepellent';
import MensCasualShoes from './pages/men/MensCasualShoes';
import MensHikingBoots from './pages/men/MensHikingBoots';
import MensBestSellers from './pages/men/MensBestSellers';
import MensApparel from './pages/men/MensApparel';

// Women's Routes
import WomensTrainers from './pages/women/WomensTrainers';
import WomensActiveWear from './pages/women/WomensActiveWear';
import WomensBestSellers from './pages/women/WomensBestSellers';
import WomensCasualShoes from './pages/women/WomensCasualShoes';
import WomensFlats from './pages/women/WomensFlats';
import WomensRunning from './pages/women/WomensRunning';
import WomensLifestyle from './pages/women/WomensLifestyle';
import WomensLeggings from './pages/women/WomensLeggings';
import WomensTops from './pages/women/WomensTops';
import WomensSpring from './pages/women/WomensSpring';

// Kids' Routes
import KidsTrainers from './pages/kids/KidsTrainers';
import KidsActiveSneakers from './pages/kids/KidsActiveSneakers';
import KidsSchool from './pages/kids/KidsSchool';
import KidsBackToSchool from './pages/kids/KidsBackToSchool';
import KidsSummer from './pages/kids/KidsSummer';
import KidsToddler from './pages/kids/age-groups/KidsToddler';
import KidsLittle from './pages/kids/age-groups/KidsLittle';
import KidsBig from './pages/kids/age-groups/KidsBig';
import KidsNewArrivals from './pages/kids/featured/KidsNewArrivals';
import KidsBestSellers from './pages/kids/featured/KidsBestSellers';
import { default as KidsFeaturedSale } from './pages/kids/featured/KidsSale';

// Socks Routes
import CrewSocks from './pages/socks/styles/CrewSocks';
import AnkleSocks from './pages/socks/styles/AnkleSocks';
import NoShowSocks from './pages/socks/styles/NoShowSocks';
import RunningSocks from './pages/socks/activities/RunningSocks';
import EverydaySocks from './pages/socks/activities/EverydaySocks';
import AthleticSocks from './pages/socks/activities/AthleticSocks';
import PerformanceCollection from './pages/socks/PerformanceCollection';
import SustainableComfort from './pages/socks/SustainableComfort';
import LimitedSocks from './pages/socks/collections/LimitedSocks';
import MerinoSocks from './pages/socks/collections/MerinoSocks';
import OrganicSocks from './pages/socks/collections/OrganicSocks';

// Accessories Routes
import ToteBags from './pages/accessories/bags/ToteBags';
import Backpacks from './pages/accessories/bags/Backpacks';
import Wallets from './pages/accessories/Wallets';
import TravelCollection from './pages/accessories/TravelCollection';
import EssentialAccessories from './pages/accessories/EssentialAccessories';
import Watches from './pages/accessories/Watches';
import Bracelets from './pages/accessories/Bracelets';
import Necklaces from './pages/accessories/Necklaces';
import Hats from './pages/accessories/Hats';
import ShoeCare from './pages/accessories/ShoeCare';
import GiftCards from './pages/accessories/GiftCards';

// Sale Routes
import MensSale from './pages/sale/MensSale';
import WomensSale from './pages/sale/WomensSale';
import { default as KidsSale } from './pages/sale/KidsSale';
import ComfortApproach from './pages/approach/ComfortApproach';
import SustainabilityApproach from './pages/approach/SustainabilityApproach';
import MaterialsApproach from './pages/approach/MaterialsApproach';
import ComfortCollection from './pages/collections/ComfortCollection';
import SummerCollection from './pages/collections/SummerCollection';
import SustainableCollection from './pages/collections/SustainableCollection';
import SpecialOffer from './pages/collections/SpecialOffer';
import Sale from './pages/collections/Sale';
import LimitedEdition from './pages/collections/LimitedEdition';
import Collaborations from './pages/collections/Collaborations';
import NewArrivals from './pages/collections/NewArrivals';
import BestSellers from './pages/collections/BestSellers';
import MensCollection from './pages/collections/MensCollection';
import WomensCollection from './pages/collections/WomensCollection';
import KidsCollection from './pages/collections/KidsCollection';

// Account Pages
import OrderHistory from './pages/account/OrderHistory';
import OrderDetails from './pages/account/OrderDetails';
import SavedAddresses from './pages/account/SavedAddresses';
import PaymentMethods from './pages/account/PaymentMethods';
import PaymentConfirmation from './pages/PaymentConfirmation';

// Auth Route Component
import AuthRoute from './components/AuthRoute';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <FavoritesProvider>
          <SearchProvider>
            <Router>
              <div className="min-h-screen">
                <Navbar />
                <Routes>
                  {/* Main Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
                  
                  {/* Payment Confirmation Route with Stripe Elements */}
                  <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
                  
                  {/* Account Routes */}
                  <Route path="/account/orders" element={<AuthRoute><OrderHistory /></AuthRoute>} />
                  <Route path="/account/orders/:orderId" element={<AuthRoute><OrderDetails /></AuthRoute>} />
                  <Route path="/account/addresses" element={<AuthRoute><SavedAddresses /></AuthRoute>} />
                  <Route path="/account/payment-methods" element={<AuthRoute><PaymentMethods /></AuthRoute>} />
                  
                  {/* Support Routes */}
                  <Route path="/faqs" element={<FAQs />} />
                  <Route path="/size-guide" element={<SizeGuide />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/unsubscribe" element={<Unsubscribe />} />
                  <Route path="/help" element={<Help />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfService />} />
                  <Route path="/cookies" element={<CookiePolicy />} />
                  
                  {/* Company Routes */}
                  <Route path="/about" element={<About />} />
                  <Route path="/sustainability" element={<Sustainability />} />
                  <Route path="/careers" element={<Careers />} />
                  <Route path="/press" element={<Press />} />
                  <Route path="/partners" element={<Partners />} />
                  
                  {/* Category Landing Pages */}
                  <Route path="/category/men" element={<CategoryMen />} />
                  <Route path="/category/women" element={<CategoryWomen />} />
                  <Route path="/category/kids" element={<CategoryKids />} />
                  <Route path="/category/socks" element={<CategorySocks />} />
                  <Route path="/category/accessories" element={<CategoryAccessories />} />
                  <Route path="/sale" element={<CategorySale />} />

                  {/* Product Details */}
                  <Route path="/product/:slug" element={<ProductDetails />} />
                  <Route path="/product/wool-runner-go" element={<WoolRunnerGo />} />

                  {/* Men's Routes */}
                  <Route path="/category/men/trainers" element={<MensTrainers />} />
                  <Route path="/category/men/active" element={<MensActiveShoes />} />
                  <Route path="/category/men/water-repellent" element={<MensWaterRepellent />} />
                  <Route path="/category/men/casual" element={<MensCasualShoes />} />
                  <Route path="/category/men/hiking" element={<MensHikingBoots />} />
                  <Route path="/category/men/best-sellers" element={<MensBestSellers />} />
                  <Route path="/category/men/apparel" element={<MensApparel />} />

                  {/* Women's Routes */}
                  <Route path="/category/women/trainers" element={<WomensTrainers />} />
                  <Route path="/category/women/activewear" element={<WomensActiveWear />} />
                  <Route path="/category/women/best-sellers" element={<WomensBestSellers />} />
                  <Route path="/category/women/casual" element={<WomensCasualShoes />} />
                  <Route path="/category/women/flats" element={<WomensFlats />} />
                  <Route path="/category/women/running" element={<WomensRunning />} />
                  <Route path="/category/women/lifestyle" element={<WomensLifestyle />} />
                  <Route path="/category/women/leggings" element={<WomensLeggings />} />
                  <Route path="/category/women/tops" element={<WomensTops />} />
                  <Route path="/category/women/spring" element={<WomensSpring />} />

                  {/* Kids' Routes */}
                  <Route path="/category/kids/trainers" element={<KidsTrainers />} />
                  <Route path="/category/kids/active" element={<KidsActiveSneakers />} />
                  <Route path="/category/kids/school" element={<KidsSchool />} />
                  <Route path="/category/kids/back-to-school" element={<KidsBackToSchool />} />
                  <Route path="/category/kids/summer" element={<KidsSummer />} />
                  <Route path="/category/kids/toddler" element={<KidsToddler />} />
                  <Route path="/category/kids/little-kids" element={<KidsLittle />} />
                  <Route path="/category/kids/big-kids" element={<KidsBig />} />
                  <Route path="/category/kids/new" element={<KidsNewArrivals />} />
                  <Route path="/category/kids/bestsellers" element={<KidsBestSellers />} />
                  <Route path="/category/kids/sale" element={<KidsFeaturedSale />} />
                  
                  {/* Socks Routes */}
                  <Route path="/category/socks/crew" element={<CrewSocks />} />
                  <Route path="/category/socks/ankle" element={<AnkleSocks />} />
                  <Route path="/category/socks/no-show" element={<NoShowSocks />} />
                  <Route path="/category/socks/running" element={<RunningSocks />} />
                  <Route path="/category/socks/everyday" element={<EverydaySocks />} />
                  <Route path="/category/socks/athletic" element={<AthleticSocks />} />
                  <Route path="/category/socks/performance" element={<PerformanceCollection />} />
                  <Route path="/category/socks/sustainable" element={<SustainableComfort />} />
                  <Route path="/category/socks/limited" element={<LimitedSocks />} />
                  <Route path="/category/socks/merino" element={<MerinoSocks />} />
                  <Route path="/category/socks/organic" element={<OrganicSocks />} />

                  {/* Accessories Routes */}
                  <Route path="/category/accessories/bags/tote" element={<ToteBags />} />
                  <Route path="/category/accessories/bags/backpack" element={<Backpacks />} />
                  <Route path="/category/accessories/wallets" element={<Wallets />} />
                  <Route path="/category/accessories/travel" element={<TravelCollection />} />
                  <Route path="/category/accessories/essentials" element={<EssentialAccessories />} />
                  <Route path="/category/accessories/watches" element={<Watches />} />
                  <Route path="/category/accessories/bracelets" element={<Bracelets />} />
                  <Route path="/category/accessories/necklaces" element={<Necklaces />} />
                  <Route path="/category/accessories/hats" element={<Hats />} />
                  <Route path="/category/accessories/shoe-care" element={<ShoeCare />} />
                  <Route path="/category/accessories/gift-cards" element={<GiftCards />} />
                  
                  {/* Sale Routes */}
                  <Route path="/sale/men" element={<MensSale />} />
                  <Route path="/sale/women" element={<WomensSale />} />
                  <Route path="/sale/kids" element={<KidsSale />} />
                  
                  {/* Approach Routes */}
                  <Route path="/approach/comfort" element={<ComfortApproach />} />
                  <Route path="/approach/sustainability" element={<SustainabilityApproach />} />
                  <Route path="/approach/materials" element={<MaterialsApproach />} />
                  
                  {/* Collection Routes */}
                  <Route path="/collections/comfort" element={<ComfortCollection />} />
                  <Route path="/collections/summer" element={<SummerCollection />} />
                  <Route path="/collections/sustainable" element={<SustainableCollection />} />
                  <Route path="/collections/special-offer" element={<SpecialOffer />} />
                  <Route path="/collections/sale" element={<Sale />} />
                  <Route path="/collections/limited-edition" element={<LimitedEdition />} />
                  <Route path="/collections/collaborations" element={<Collaborations />} />
                  <Route path="/collections/best-sellers" element={<BestSellers />} />
                  <Route path="/collections/new" element={<NewArrivals />} />
                  <Route path="/collections/mens" element={<MensCollection />} />
                  <Route path="/collections/womens" element={<WomensCollection />} />
                  <Route path="/collections/kids" element={<KidsCollection />} />
                </Routes>
                <Footer />
              </div>
            </Router>
          </SearchProvider>
        </FavoritesProvider>
      </CartProvider>
    </AuthProvider>
  );
}