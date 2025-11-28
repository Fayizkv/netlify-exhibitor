import React, { useState, useEffect, useCallback } from "react";
import AutoForm from "../../../../../core/autoform/AutoForm";
import { Form, FormContainer, FormHead, Forms } from "./styles";
import { GetIcon } from "../../../../../../icons";
import { IconButton } from "../../../../../core/elements";
import { NoData } from "../../../../../core/list/styles";

export const Attendees = ({ tickets, quantities, statusChange }) => {
  let cumulativeCount = 0;
  const [opened, setOpened] = useState({});
  const [formData, setFormData] = useState({});
  const [allFormSubmitted, setAllFormSubmitted] = useState(false);

  const toggleOpen = (key) => {
    setOpened((prevOpened) => ({
      ...prevOpened,
      [key]: !prevOpened[key],
    }));
  };

  const submit = (key, data, status) => {
    setFormData((prevData) => {
      if (status) {
        return {
          ...prevData,
          [key]: data,
        };
      } else {
        const { [key]: removed, ...rest } = prevData;
        return rest;
      }
    });
    checkAllFormsSubmitted();
  };

  const checkAllFormsSubmitted = useCallback(() => {
    const totalForms = tickets.reduce((total, ticket) => {
      const quantity = ticket.formInputs?.filter((field) => field.add).length > 0 ? quantities[ticket._id] || 0 : 0;
      return total + quantity;
    }, 0);
    const submittedForms = Object.keys(formData).length;

    const allSubmitted = submittedForms === totalForms;
    setAllFormSubmitted(allSubmitted);
    statusChange(allSubmitted, formData);
  }, [formData, quantities, tickets, statusChange]);

  useEffect(() => {
    checkAllFormsSubmitted();
    statusChange(allFormSubmitted, formData);
  }, [allFormSubmitted, formData, statusChange, checkAllFormsSubmitted]);

  // Check if there are any tickets with quantities
  const hasTicketsWithQuantities = tickets.some((ticket) => quantities[ticket._id] > 0);

  if (!hasTicketsWithQuantities) {
    return (
      <NoData>
        <GetIcon icon="ticket" />
        <p>No tickets selected</p>
      </NoData>
    );
  }

  // Sort tickets: those with input fields first, then those without
  const sortedTickets = [...tickets].sort((a, b) => {
    const aHasInputs = a.formInputs?.some((field) => field.add) ?? false;
    const bHasInputs = b.formInputs?.some((field) => field.add) ?? false;

    if (aHasInputs === bHasInputs) return 0;
    return aHasInputs ? -1 : 1;
  });

  return (
    <Forms>
      {/* <pre>
        <code> {JSON.stringify({ quantities, formData }, null, 2)}</code>
      </pre> */}
      {sortedTickets.map((ticket) => {
        const quantity = quantities[ticket._id] || 0;
        if (quantity > 0) {
          const hasFormInputs = ticket.formInputs?.some((field) => field.add);

          if (!hasFormInputs) {
            return (
              <FormContainer key={ticket._id}>
                <FormHead>
                  <div>
                    <GetIcon icon="ticket" /> {ticket.title}
                  </div>
                  <div className="info">
                    <GetIcon icon="success" /> <span>No information required</span>
                  </div>
                </FormHead>
              </FormContainer>
            );
          }

          return (
            <React.Fragment key={ticket._id}>
              {Array.from({ length: quantity }).map((_, index) => {
                cumulativeCount += 1;
                const key = `${ticket._id}-${index}`;
                return (
                  <FormContainer key={key}>
                    <FormHead onClick={() => toggleOpen(key)}>
                      <div>
                        <GetIcon icon="ticket" /> {ticket.title} #{cumulativeCount}
                      </div>
                      <IconButton align="plain" icon={opened[key] ? "up" : "down"} />
                    </FormHead>
                    <Form className={opened[key] ? "" : "hidden"}>
                      <AutoForm
                        useCaptcha={false}
                        key={`type-${key}`}
                        useCheckbox={false}
                        customClass="embed checkout"
                        description=""
                        formValues={{}}
                        formMode={ticket.formMode ?? "double"}
                        formType="post"
                        header=" "
                        formInput={ticket.formInputs}
                        submitHandler={(data, status) => {
                          submit(key, data, status);
                        }}
                        button=""
                        isOpenHandler={() => {}}
                        css="plain embed checkout"
                        isOpen={opened[key]}
                        plainForm={true}
                        autoUpdate={true}
                      />
                    </Form>
                  </FormContainer>
                );
              })}
            </React.Fragment>
          );
        }
        return null;
      })}
    </Forms>
  );
};
