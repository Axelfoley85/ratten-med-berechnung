import React from "react";
import { useForm } from "react-hook-form";
import { UseFormRegister } from 'react-hook-form';

type FormFields = {
  concentration_mg_ml: number;
  daily_dose_mg_kgw: number;
  weight_g: number;
  treatment_length_days: number;
  min_daily_dose_ml: number;
}

const formFields = [
  { label: "Konzentration [mg/ml]", name: "concentration_mg_ml" },
  { label: "Tagesdosis in mg pro kg Gewicht [mg/KGW]", name: "daily_dose_mg_kgw" },
  { label: "Gewicht des Tieres [g]", name: "weight_g" },
  { label: "Behandlungslänge [Tage]", name: "treatment_length_days" },
  { label: "Mindesttagesdosierung Gemisch (z.B. die Mindestmenge pro Tag die in der Spritze gut dosiert werden kann) [ml]", name: "min_daily_dose_ml" },
];

interface InputFieldProps {
  label: string;
  register: UseFormRegister<FormFields>;
  name: string;
}

type OutputFieldProps = {
  label: string;
  value: number;
};

const InputField: React.FC<InputFieldProps> = ({ label, register, name }) => (
  <div className="mb-2">
    <label className="block text-gray-300 text-sm font-bold mb-2" htmlFor={name}>
      {label}
    </label>
    <input
      {...register(name as keyof FormFields)}
      className="shadow appearance-none border rounded w-1/4 py-1 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    />
  </div>
);

const OutputField: React.FC<OutputFieldProps> = ({ label, value }) => (
  <div className="mb-2">
    <label className="block text-gray-400 text-sm font-bold mb-2">
      {label}
    </label>
    <div className="shadow appearance-none border rounded w-1/4 py-1 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline">
      {value.toFixed(3)}
    </div>
  </div>
);

function ceilToNearest(num: number, precision: number) {
  return Math.ceil(num / precision) * precision;
}

export default function Calculator() {
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      concentration_mg_ml: 100,
      daily_dose_mg_kgw: 20,
      weight_g: 350,
      treatment_length_days: 14,
      min_daily_dose_ml: 0.2,
    },
  });

  const daily_dose_mg_kgw = watch("daily_dose_mg_kgw");
  const concentration_mg_ml = watch("concentration_mg_ml");
  const weight_g = watch("weight_g")
  const treatment_length_days = watch("treatment_length_days")
  const min_daily_dose_ml = watch("min_daily_dose_ml")

  const daily_dose_ml_kgw = daily_dose_mg_kgw / concentration_mg_ml;
  const weight_factor = weight_g / 1000
  const daily_dose_normalized_weight_ml = daily_dose_ml_kgw * weight_factor
  const total_treatment_amount_medication_ml = daily_dose_normalized_weight_ml * treatment_length_days
  const daily_fruit_juice_mix_ml = ceilToNearest((total_treatment_amount_medication_ml * 2) / treatment_length_days, min_daily_dose_ml)

  const total_fruit_juice_solution_ml = daily_fruit_juice_mix_ml * treatment_length_days
  const total_fruit_juice_amount_ml = total_fruit_juice_solution_ml - total_treatment_amount_medication_ml

  const onSubmit = ((data: any) => {
    console.log(data);
  });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen py-2 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl mb-4">
          Berechnung von Medikamentmischlösungen zur oralen Einnahme bei
          Kleintieren
        </h1>
        <p className="text-1xl mb-4">
          Für meine Ratten erstelle ich regelmäßig Medikamentenlösungen.
          Ich mische dabei z.B. Antibiotikum mit Fruchtsaft.
        </p>
        <p className="text-1xl mb-4">
          Die Vorgefüllten Werte gelten für eine Baytril 10% Lösung, welche mit
          Fruchtsaft zu einer ungefähren 1:1 Mischung angemischt werden können.
        </p>
        <p className="text-1xl mb-4">
          Ich übernehme keinerlei Verantwortung für die korrekte
          Dosierung von Medikamenten.
          Medikamente und dessen Dosierung sollten genau überprüft und von einem
          Tierarzt veordnet werden.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-around max-w-2xl sm:w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 w-full"
        >
          {formFields.map((field) => (
            <InputField
              key={field.name}
              label={field.label}
              register={register}
              name={field.name as keyof FormFields} // the change is here
            />
          ))}
          
          <OutputField label="Gesamtmenge Medikament [ml]" value={total_treatment_amount_medication_ml} />
          <OutputField label="Gesamtmenge Fruchtsaft [ml]" value={total_fruit_juice_amount_ml} />
          <OutputField label="Gesamtmenge Fruchtsaft-Medikament-Gemisch [ml]" value={total_fruit_juice_solution_ml} />
          <OutputField label="Tageseinheit Fruchts-Medikament-Gemisch [ml]" value={daily_fruit_juice_mix_ml} />

        </form>
      </div>
    </main>
  );
}
