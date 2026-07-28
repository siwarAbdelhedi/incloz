import ShopCards from '../components/BoutiquePages/ShopCards';
import ProcessSteps from '../components/BoutiquePages/ProcessSteps';
import BoutiqueServices from '../components/BoutiquePages/BoutiqueServices';

const BoutiquePage = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#FFF' }}>
      <ShopCards />
      <BoutiqueServices />
      <ProcessSteps />
    </div>
  );
};

export default BoutiquePage;
