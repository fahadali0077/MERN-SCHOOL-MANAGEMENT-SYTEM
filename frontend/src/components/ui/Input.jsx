import React from 'react';
import styled, { css } from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

const Label = styled.label`
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-neutral-700);
  line-height: 1.4;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const IconLeft = styled.span`
  position: absolute;
  left: 12px;
  display: flex;
  align-items: center;
  color: var(--color-neutral-400);
  pointer-events: none;
  font-size: 16px;
`;

const IconRight = styled.span`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  color: var(--color-neutral-400);
  cursor: pointer;
`;

const StyledInput = styled.input`
  width: 100%;
  height: 40px;
  padding: ${props => props.$hasLeftIcon ? '0 12px 0 40px' : '0 12px'};
  padding-right: ${props => props.$hasRightIcon ? '40px' : '12px'};
  background: var(--bg-card);
  border: 1.5px solid ${props => props.$error ? 'var(--color-danger)' : 'var(--color-neutral-200)'};
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  color: var(--color-neutral-800);
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  outline: none;

  &::placeholder {
    color: var(--color-neutral-400);
  }

  &:focus {
    border-color: ${props => props.$error ? 'var(--color-danger)' : 'var(--color-primary-500)'};
    box-shadow: 0 0 0 3px ${props => props.$error
      ? 'rgba(239, 68, 68, 0.12)'
      : 'rgba(14, 165, 233, 0.15)'};
  }

  &:disabled {
    background: var(--color-neutral-50);
    color: var(--color-neutral-400);
    cursor: not-allowed;
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  background: var(--bg-card);
  border: 1.5px solid ${props => props.$error ? 'var(--color-danger)' : 'var(--color-neutral-200)'};
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  color: var(--color-neutral-800);
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  outline: none;
  resize: vertical;
  line-height: 1.6;

  &::placeholder { color: var(--color-neutral-400); }

  &:focus {
    border-color: ${props => props.$error ? 'var(--color-danger)' : 'var(--color-primary-500)'};
    box-shadow: 0 0 0 3px ${props => props.$error
      ? 'rgba(239, 68, 68, 0.12)'
      : 'rgba(14, 165, 233, 0.15)'};
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  height: 40px;
  padding: 0 12px;
  background: var(--bg-card);
  border: 1.5px solid ${props => props.$error ? 'var(--color-danger)' : 'var(--color-neutral-200)'};
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: var(--text-sm);
  color: var(--color-neutral-800);
  transition: border-color var(--transition-base), box-shadow var(--transition-base);
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;

  &:focus {
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
  }
`;

const ErrorMessage = styled.p`
  font-size: var(--text-xs);
  color: var(--color-danger);
  line-height: 1.4;
`;

const HelpText = styled.p`
  font-size: var(--text-xs);
  color: var(--color-neutral-500);
  line-height: 1.4;
`;

const CharCount = styled.span`
  font-size: var(--text-xs);
  color: var(--color-neutral-400);
  align-self: flex-end;
`;

// ─── Input Component ───
const Input = React.forwardRef(({
  label,
  error,
  help,
  leftIcon,
  rightIcon,
  className,
  ...props
}, ref) => (
  <Wrapper className={className}>
    {label && <Label htmlFor={props.id || props.name}>{label}</Label>}
    <InputWrapper>
      {leftIcon && <IconLeft>{leftIcon}</IconLeft>}
      <StyledInput
        ref={ref}
        $error={!!error}
        $hasLeftIcon={!!leftIcon}
        $hasRightIcon={!!rightIcon}
        {...props}
      />
      {rightIcon && <IconRight>{rightIcon}</IconRight>}
    </InputWrapper>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {!error && help && <HelpText>{help}</HelpText>}
  </Wrapper>
));
Input.displayName = 'Input';

// ─── Textarea Component ───
export const Textarea = React.forwardRef(({
  label,
  error,
  help,
  maxLength,
  value,
  className,
  ...props
}, ref) => (
  <Wrapper className={className}>
    {label && (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Label htmlFor={props.id || props.name}>{label}</Label>
        {maxLength && <CharCount>{(value || '').length}/{maxLength}</CharCount>}
      </div>
    )}
    <StyledTextarea
      ref={ref}
      $error={!!error}
      maxLength={maxLength}
      value={value}
      {...props}
    />
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {!error && help && <HelpText>{help}</HelpText>}
  </Wrapper>
));
Textarea.displayName = 'Textarea';

// ─── Select Component ───
export const Select = React.forwardRef(({
  label,
  error,
  help,
  children,
  className,
  ...props
}, ref) => (
  <Wrapper className={className}>
    {label && <Label htmlFor={props.id || props.name}>{label}</Label>}
    <StyledSelect ref={ref} $error={!!error} {...props}>
      {children}
    </StyledSelect>
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {!error && help && <HelpText>{help}</HelpText>}
  </Wrapper>
));
Select.displayName = 'Select';

export default Input;
