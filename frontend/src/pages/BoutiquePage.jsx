import ShopCards from '../components/BoutiquePages/ShopCards';
import ProcessSteps from '../components/BoutiquePages/ProcessSteps';
import BoutiqueServices from '../components/BoutiquePages/BoutiqueServices';

const BoutiquePage = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#FFF' }}>
      {/* Ici « La boutique » est le sujet de la page ; sur l'accueil, le même
          bloc n'est qu'une section et garde son <h2> par défaut. */}
      <ShopCards titreComposant="h1" />
      <BoutiqueServices />
      <ProcessSteps />
    </div>
  );
};

export default BoutiquePage;
