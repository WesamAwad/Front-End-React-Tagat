import { HeroSection } from "./HeroSection";
import { CategoriesSection } from "./CategoriesSection";
import { NearbyWorkshopsSection } from "./NearbyWorkshopsSection";
import { JoinWorkshopSection } from "./JoinWorkshopSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { AIDiagnosisSection } from "./AIDiagnosisSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { RepairCtaSection } from "./RepairCtaSection";

function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <NearbyWorkshopsSection />
      <JoinWorkshopSection />
      <HowItWorksSection />
      <AIDiagnosisSection />
      <TestimonialsSection />

      {/* خارج قيود الـ container — يمتد على عرض الشاشة كامل */}
      <RepairCtaSection />
    </>
  );
}

export default HomePage;
