import MacroRing from './MacroRing'

interface MacroData { current: number; target: number }
interface Props {
  protein: MacroData
  carbs: MacroData
  fat: MacroData
}

export default function MacroSection({ protein, carbs, fat }: Props) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <MacroRing label="Protein" current={protein.current} target={protein.target} color="primary" />
      <MacroRing label="Carbohydrates" current={carbs.current} target={carbs.target} color="tertiary" />
      <MacroRing label="Healthy Fats" current={fat.current} target={fat.target} color="secondary" />
    </section>
  )
}
