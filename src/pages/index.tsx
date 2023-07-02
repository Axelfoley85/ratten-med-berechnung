import React, { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { UseFormRegister } from 'react-hook-form';
import { useRouter } from "next/router";
import QRCode from 'qrcode.react';


type FormFields = {
  concentration_mg_ml: number;
  daily_dose_mg_kgw: number;
  weight_g: number;
  treatment_length_days: number;
  min_daily_dose_ml: number;
}

type OutputFieldProps = {
  label: string;
  value: number;
};

type OutputLinkProps = {
  values: FormFields;
};

const formFields = [
  { label: "Konzentration des Medikaments [mg/ml]", name: "concentration_mg_ml" },
  { label: "Tagesdosis in mg pro kg Gewicht [mg/KGW]", name: "daily_dose_mg_kgw" },
  { label: "Gewicht des Tieres [g]", name: "weight_g" },
  { label: "Behandlungslänge [Tage]", name: "treatment_length_days" },
  { label: "Mindesttagesdosierung Gemisch (z.B. die Mindestgesamtmenge an Gemisch pro Tag die in der Spritze gut dosiert werden kann) [ml]", name: "min_daily_dose_ml" },
];

interface InputFieldProps {
  label: string;
  register: UseFormRegister<FormFields>;
  name: string;
}

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

const OutputField: React.FC<OutputFieldProps> = ({ label, value }) => {
  // Use toFixed(3) and then remove trailing zeros and possibly the decimal point
  const displayValue = value.toFixed(3).replace(/\.?0+$/, "");
  
  return (
    <div className="mb-2">
      <label className="block text-gray-400 text-sm font-bold mb-2">
        {label}
      </label>
      <div className="shadow appearance-none border rounded w-1/4 py-1 px-3 text-gray-300 leading-tight focus:outline-none focus:shadow-outline">
        {displayValue}
      </div>
    </div>
  );
};


function ceilToNearest(num: number, precision: number) {
  return Math.ceil(num / precision) * precision;
}

const OutputLink: React.FC<OutputLinkProps> = ({ values }) => {
  const router = useRouter();
  const stringifiedValues = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [key, String(value)])
  );
  const query = new URLSearchParams(stringifiedValues);
  // ensure window is defined before using it
  let url;
  if (typeof window !== "undefined") {
    url = `${window.location.origin}${router.pathname}?${query.toString()}`;
  } else {
    // provide a fallback or handle appropriately
    url = '';
  }

  const urlInputRef = useRef<HTMLInputElement>(null);

  const handleCopyClick = async () => {
    if (urlInputRef.current) {
      await navigator.clipboard.writeText(urlInputRef.current.value);
    }
  }

  return (
    <div className="mb-4">
      <label className="block text-gray-400 text-sm font-bold mb-2">
        Werte teilen
      </label>
      <div className="flex items-center">
        <input
          ref={urlInputRef}
          readOnly
          value={url.toString()}
          className="block w-full bg-gray-400 text-sm py-1 px-2 rounded text-left mb-2 overflow-scroll"
        />
        <button 
          onClick={handleCopyClick}
          className="ml-2 py-1 px-2 bg-gray-700 text-white rounded cursor-pointer"
        >
          Kopieren
        </button>
      </div>
      <div className="flex justify-center">
        <QRCode value={url} />
      </div>
    </div>
  );
};

export default function Calculator() {
  const router = useRouter()

  const defaultValues = {
    concentration_mg_ml: 100,
    daily_dose_mg_kgw: 20,
    weight_g: 350,
    treatment_length_days: 14,
    min_daily_dose_ml: 0.2,
  };

  const { register, handleSubmit, watch, reset } = useForm<FormFields>({
    defaultValues,
  });

  // Update form state from URL when component mounts
  useEffect(() => {
    if (Object.keys(router.query).length > 0) {
      const initialFormValues = {
        concentration_mg_ml: parseFloat(router.query.concentration_mg_ml as string) || defaultValues.concentration_mg_ml,
        daily_dose_mg_kgw: parseFloat(router.query.daily_dose_mg_kgw as string) || defaultValues.daily_dose_mg_kgw,
        weight_g: parseFloat(router.query.weight_g as string) || defaultValues.weight_g,
        treatment_length_days: parseFloat(router.query.treatment_length_days as string) || defaultValues.treatment_length_days,
        min_daily_dose_ml: parseFloat(router.query.min_daily_dose_ml as string) || defaultValues.min_daily_dose_ml,
      };

      reset(initialFormValues);
    }
  }, [router.query, reset]);

  // Update URL from form state whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      const queryParams = {
        concentration_mg_ml: watch("concentration_mg_ml"),
        daily_dose_mg_kgw: watch("daily_dose_mg_kgw"),
        weight_g: watch("weight_g"),
        treatment_length_days: watch("treatment_length_days"),
        min_daily_dose_ml: watch("min_daily_dose_ml"),
      };
      if (window.location.protocol !== 'https:' && window.location.host !== 'localhost:3000') {
        router.push({
          pathname: router.pathname,
          query: queryParams,
        }, undefined, { scroll: false });
      }
    }
  }, [router, watch]);

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
  const percentage_of_medication_in_mix = 100 * total_treatment_amount_medication_ml / total_fruit_juice_solution_ml

  const formValues = {
    concentration_mg_ml: watch("concentration_mg_ml"),
    daily_dose_mg_kgw: watch("daily_dose_mg_kgw"),
    weight_g: watch("weight_g"),
    treatment_length_days: watch("treatment_length_days"),
    min_daily_dose_ml: watch("min_daily_dose_ml"),
  };

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

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-around max-w-2xl w-full sm:w-full">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 w-full lg:w-1/2"
        >
          {formFields.map((field) => (
            <InputField
              key={field.name}
              label={field.label}
              register={register}
              name={field.name as keyof FormFields} // the change is here
            />
          ))}
        </form>
          
        <div className="p-6 w-full lg:w-1/2">
          <OutputField label="Medikamentenmenge pro Tag [ml]" value={daily_dose_normalized_weight_ml} />
          <OutputField label="Anteil an Medikament im Gemisch [%]" value={percentage_of_medication_in_mix} />
          <OutputField label="Gesamtmenge Medikament [ml]" value={total_treatment_amount_medication_ml} />
          <OutputField label="Gesamtmenge Fruchtsaft o.ä. [ml]" value={total_fruit_juice_amount_ml} />
          <OutputField label="Gesamtmenge Medikament-Gemisch [ml]" value={total_fruit_juice_solution_ml} />
          <OutputField label="Tageseinheit Medikament-Gemisch (Wieviel kommt pro Tag in die Spritze?) [ml]" value={daily_fruit_juice_mix_ml} />
        </div>
      </div>

      <div className="p-1 w-full lg:w-1/4">
        <OutputLink values={formValues} />
      </div>
    </main>
  );
}
