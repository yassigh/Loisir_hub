import React from 'react';
import styles from './KpiCard.module.css';

const KpiCard = ({ title, value }) => {
  return (
    <div className={styles.card}>
      <h4 className={styles.title}>{title}</h4>
      <h2 className={styles.value}>{value}</h2>
    </div>
  );
};

export default KpiCard;